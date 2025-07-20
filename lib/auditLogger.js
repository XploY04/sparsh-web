import AuditLog from "../models/AuditLog";
import dbConnect from "./dbConnect";

/**
 * Logs an action to the audit trail
 * @param {string} userId - The ID of the user performing the action
 * @param {string} action - The action being performed
 * @param {object} details - Additional details about the action
 * @param {object} metadata - Optional metadata including trialId, participantId, ipAddress, userAgent
 * @returns {Promise<object>} The created audit log entry
 */
export async function logAction(userId, action, details, metadata = {}) {
  try {
    await dbConnect();

    const auditEntry = new AuditLog({
      userId,
      action,
      details,
      trialId: metadata.trialId,
      participantId: metadata.participantId,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    const savedEntry = await auditEntry.save();

    console.log(`Audit Log: ${action} by user ${userId}`, {
      logId: savedEntry._id,
      details,
      metadata,
    });

    return savedEntry;
  } catch (error) {
    console.error("Failed to create audit log entry:", error);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
}

/**
 * Gets audit logs with optional filtering
 * @param {object} filters - Optional filters for the query
 * @param {number} limit - Maximum number of entries to return
 * @param {number} skip - Number of entries to skip
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function getAuditLogs(filters = {}, limit = 100, skip = 0) {
  try {
    await dbConnect();

    const query = AuditLog.find(filters)
      .populate("userId", "email name")
      .populate("trialId", "title")
      .populate("participantId", "participantCode")
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return await query.exec();
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    throw error;
  }
}

/**
 * Helper function to extract request metadata
 * @param {Request} request - The NextJS request object
 * @returns {object} Metadata object with IP and User Agent
 */
export function extractRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  };
}
