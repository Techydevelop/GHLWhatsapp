import express from 'express';
import { supabaseAdmin } from '../config/database';
import { authenticateToken, verifyLocationOwnership } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Connect a new subaccount (GHL location)
 * POST /admin/subaccounts/connect
 */
router.post('/subaccounts/connect', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { locationId, name } = req.body;
    const userId = req.user_id!;
    
    if (!locationId) {
      return res.status(400).json({ error: 'locationId is required' });
    }
    
    // Check if subaccount already exists for this location
    const { data: existingSubaccount } = await supabaseAdmin
      .from('subaccounts')
      .select('*')
      .eq('location_id', locationId)
      .single();
    
    if (existingSubaccount) {
      // Check if it belongs to the current user
      if (existingSubaccount.user_id !== userId) {
        return res.status(403).json({ error: 'Location already connected to another account' });
      }
      
      // Update name if provided
      if (name && name !== existingSubaccount.name) {
        const { data: updatedSubaccount, error } = await supabaseAdmin
          .from('subaccounts')
          .update({ name })
          .eq('id', existingSubaccount.id)
          .select()
          .single();
        
        if (error) throw error;
        return res.json({ 
          id: updatedSubaccount.id, 
          location_id: updatedSubaccount.location_id,
          name: updatedSubaccount.name,
          created_at: updatedSubaccount.created_at
        });
      }
      
      return res.json({ 
        id: existingSubaccount.id, 
        location_id: existingSubaccount.location_id,
        name: existingSubaccount.name,
        created_at: existingSubaccount.created_at
      });
    }
    
    // Create new subaccount
    const { data: newSubaccount, error } = await supabaseAdmin
      .from('subaccounts')
      .insert({
        user_id: userId,
        location_id: locationId,
        name: name || `Location ${locationId}`
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`Created subaccount for user ${userId}, location ${locationId}`);
    
    res.status(201).json({ 
      id: newSubaccount.id, 
      location_id: newSubaccount.location_id,
      name: newSubaccount.name,
      created_at: newSubaccount.created_at
    });
    
  } catch (error) {
    console.error('Connect subaccount error:', error);
    res.status(500).json({ error: 'Failed to connect subaccount' });
  }
});

/**
 * Get all subaccounts for the current user
 * GET /admin/subaccounts
 */
router.get('/subaccounts', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user_id!;
    
    const { data: subaccounts, error } = await supabaseAdmin
      .from('subaccounts')
      .select(`
        *,
        sessions!inner(
          id,
          status,
          phone_number,
          created_at,
          updated_at
        ),
        location_session_map!inner(
          session_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to include session info
    const transformedSubaccounts = subaccounts.map(subaccount => ({
      id: subaccount.id,
      location_id: subaccount.location_id,
      name: subaccount.name,
      created_at: subaccount.created_at,
      session: subaccount.sessions?.[0] ? {
        id: subaccount.sessions[0].id,
        status: subaccount.sessions[0].status,
        phone_number: subaccount.sessions[0].phone_number,
        created_at: subaccount.sessions[0].created_at,
        updated_at: subaccount.sessions[0].updated_at
      } : null
    }));
    
    res.json(transformedSubaccounts);
    
  } catch (error) {
    console.error('Get subaccounts error:', error);
    res.status(500).json({ error: 'Failed to get subaccounts' });
  }
});

/**
 * Get specific subaccount by location ID
 * GET /admin/subaccounts/:locationId
 */
router.get('/subaccounts/:locationId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { locationId } = req.params;
    const userId = req.user_id!;
    
    // Verify user owns this location
    const ownsLocation = await verifyLocationOwnership(userId, locationId);
    if (!ownsLocation) {
      return res.status(403).json({ error: 'Access denied to this location' });
    }
    
    const { data: subaccount, error } = await supabaseAdmin
      .from('subaccounts')
      .select(`
        *,
        sessions!inner(
          id,
          status,
          phone_number,
          qr,
          created_at,
          updated_at
        ),
        location_session_map!inner(
          session_id
        )
      `)
      .eq('location_id', locationId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subaccount not found' });
      }
      throw error;
    }
    
    // Transform the data
    const transformedSubaccount = {
      id: subaccount.id,
      location_id: subaccount.location_id,
      name: subaccount.name,
      created_at: subaccount.created_at,
      session: subaccount.sessions?.[0] ? {
        id: subaccount.sessions[0].id,
        status: subaccount.sessions[0].status,
        phone_number: subaccount.sessions[0].phone_number,
        qr: subaccount.sessions[0].qr,
        created_at: subaccount.sessions[0].created_at,
        updated_at: subaccount.sessions[0].updated_at
      } : null
    };
    
    res.json(transformedSubaccount);
    
  } catch (error) {
    console.error('Get subaccount error:', error);
    res.status(500).json({ error: 'Failed to get subaccount' });
  }
});

/**
 * Update subaccount name
 * PUT /admin/subaccounts/:locationId
 */
router.put('/subaccounts/:locationId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { locationId } = req.params;
    const { name } = req.body;
    const userId = req.user_id!;
    
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    
    // Verify user owns this location
    const ownsLocation = await verifyLocationOwnership(userId, locationId);
    if (!ownsLocation) {
      return res.status(403).json({ error: 'Access denied to this location' });
    }
    
    const { data: updatedSubaccount, error } = await supabaseAdmin
      .from('subaccounts')
      .update({ name })
      .eq('location_id', locationId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subaccount not found' });
      }
      throw error;
    }
    
    res.json({ 
      id: updatedSubaccount.id, 
      location_id: updatedSubaccount.location_id,
      name: updatedSubaccount.name,
      created_at: updatedSubaccount.created_at
    });
    
  } catch (error) {
    console.error('Update subaccount error:', error);
    res.status(500).json({ error: 'Failed to update subaccount' });
  }
});

/**
 * Delete subaccount
 * DELETE /admin/subaccounts/:locationId
 */
router.delete('/subaccounts/:locationId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { locationId } = req.params;
    const userId = req.user_id!;
    
    // Verify user owns this location
    const ownsLocation = await verifyLocationOwnership(userId, locationId);
    if (!ownsLocation) {
      return res.status(403).json({ error: 'Access denied to this location' });
    }
    
    // Delete related records first (due to foreign key constraints)
    await supabaseAdmin
      .from('location_session_map')
      .delete()
      .eq('location_id', locationId)
      .eq('user_id', userId);
    
    await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('subaccount_id', (await supabaseAdmin
        .from('subaccounts')
        .select('id')
        .eq('location_id', locationId)
        .eq('user_id', userId)
        .single()).data?.id);
    
    await supabaseAdmin
      .from('provider_installations')
      .delete()
      .eq('location_id', locationId)
      .eq('user_id', userId);
    
    // Delete the subaccount
    const { error } = await supabaseAdmin
      .from('subaccounts')
      .delete()
      .eq('location_id', locationId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    console.log(`Deleted subaccount for user ${userId}, location ${locationId}`);
    
    res.json({ message: 'Subaccount deleted successfully' });
    
  } catch (error) {
    console.error('Delete subaccount error:', error);
    res.status(500).json({ error: 'Failed to delete subaccount' });
  }
});

export default router;
