import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { supabaseAdmin } from '../config/database';

const router = Router();

// Get locations from LeadConnector for a user
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user_id;

    // Get user's marketplace account
    const { data: marketplaceAccount, error: accountError } = await supabaseAdmin
      .from('marketplace_accounts')
      .select('access_token, company_id')
      .eq('user_id', userId)
      .single();

    if (accountError || !marketplaceAccount) {
      return res.status(404).json({ error: 'Marketplace account not found' });
    }

    // TODO: Replace with actual LeadConnector API call
    // const response = await fetch(`https://services.leadconnectorhq.com/locations/`, {
    //   headers: {
    //     'Authorization': `Bearer ${marketplaceAccount.access_token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });

    // Mock data for now - replace with actual API response
    const mockLocations = [
      {
        id: 'LOC001',
        name: 'Main Office',
        address: '123 Business St, City, State',
        phone: '+1234567890',
        timezone: 'America/New_York'
      },
      {
        id: 'LOC002', 
        name: 'Branch Office',
        address: '456 Commerce Ave, City, State',
        phone: '+1987654321',
        timezone: 'America/Los_Angeles'
      },
      {
        id: 'LOC003',
        name: 'Remote Office',
        address: '789 Remote Rd, City, State', 
        phone: '+1555123456',
        timezone: 'America/Chicago'
      }
    ];

    res.json({ locations: mockLocations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

export default router;
