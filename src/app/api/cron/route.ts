import { NextRequest, NextResponse } from 'next/server';
import { agent } from '@/lib/agent';

// GET /api/cron - Run scheduled tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const job = searchParams.get('job');
    
    // Check for API key for security (in a real system, use a proper API key)
    const apiKey = searchParams.get('key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Run the specified job
    switch (job) {
      case 'deadlines':
        await agent.monitorDeadlines();
        return NextResponse.json({ success: true, job: 'deadlines' });
        
      case 'compliance':
        await agent.performComplianceChecks();
        return NextResponse.json({ success: true, job: 'compliance' });
        
      default:
        return NextResponse.json(
          { error: 'Invalid job specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error running cron job:', error);
    return NextResponse.json(
      { error: 'Failed to run cron job' },
      { status: 500 }
    );
  }
}

