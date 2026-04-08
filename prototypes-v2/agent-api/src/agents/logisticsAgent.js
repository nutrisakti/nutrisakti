/**
 * Sub-Agent: Logistics Agent
 * Handles kit requests, DID verification, hospital inventory coordination.
 * Interfaces with: blockchain tool, database tool, whatsapp tool
 */

const tools = require('../tools/mcpTools');

const KIT_PRICES_USDC = {
  'prenatal':   25,
  'delivery':   35,
  'newborn':    20,
  'nutrition':  15,
};

const logisticsAgent = {
  name: 'LogisticsAgent',

  /**
   * Process a 1-click kit request with DID verification and USDC escrow
   */
  requestKit: async (motherId, kitType) => {
    const steps = [];

    // Step 1: Verify DID on blockchain (MCP Tool: blockchain)
    const didResult = tools.blockchain.verifyDID(motherId);
    steps.push({ step: 1, action: 'did_verified', result: didResult, tool: 'blockchain' });

    if (!didResult.verified) {
      return { agent: 'LogisticsAgent', success: false, error: 'DID tidak terverifikasi', steps };
    }

    // Step 2: Check BPJS eligibility (MCP Tool: blockchain)
    const bpjsResult = tools.blockchain.checkBPJS(motherId);
    steps.push({ step: 2, action: 'bpjs_checked', result: bpjsResult, tool: 'blockchain' });

    // Step 3: Escrow USDC (MCP Tool: blockchain)
    const amount = KIT_PRICES_USDC[kitType] || 20;
    const escrowResult = tools.blockchain.escrowUSDC(motherId, kitType, amount);
    steps.push({ step: 3, action: 'usdc_escrowed', result: escrowResult, tool: 'blockchain' });

    // Step 4: Log to database (MCP Tool: database)
    const dbResult = tools.database.saveHealthLog(
      motherId, 'kit_request',
      `Kit ${kitType} diminta. USDC ${amount} di-escrow. TX: ${escrowResult.txHash}`,
      { kitType, txHash: escrowResult.txHash, amount }
    );
    steps.push({ step: 4, action: 'logged_to_database', result: dbResult, tool: 'database' });

    // Step 5: Notify NGO/Government (MCP Tool: whatsapp)
    const notifyResult = tools.whatsapp.sendAlert(
      'ngo_coordinator',
      `📦 Kit ${kitType} diminta oleh ${motherId}. USDC ${amount} di-escrow. Siapkan pengiriman ke Posyandu.`,
      'info'
    );
    steps.push({ step: 5, action: 'ngo_notified', result: notifyResult, tool: 'whatsapp' });

    return {
      agent: 'LogisticsAgent',
      success: true,
      motherId,
      kitType,
      didVerified: true,
      bpjsCovered: bpjsResult.covered,
      usdcEscrowed: amount,
      txHash: escrowResult.txHash,
      requestId: escrowResult.requestId,
      steps,
      message: `Kit ${kitType} berhasil diminta. USDC ${amount} di-escrow. Estimasi pengiriman 3-5 hari.`
    };
  },

  /**
   * Get all pending kit requests for hospital/NGO dashboard
   */
  getPendingRequests: () => {
    return tools.blockchain.getKitRequests();
  }
};

module.exports = logisticsAgent;
