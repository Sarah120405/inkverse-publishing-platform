export const createAuditLog = async (
  tx,
  { userId, action, entityType, entityId, oldValue = null, newValue = null },
) => {
  try {
    const data = {
      userId: userId,
      action: action,
      entityType: entityType,
      entityId: entityId,
      oldValue: oldValue ?? undefined,
      newValue: newValue ?? undefined,
    };

    const log = await tx.auditLog.create({
      data: data,
    });
    return log;
  } catch (error) {
    console.error("Error creating audit log:", error);
    return error;
  }
};
