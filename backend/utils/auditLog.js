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
    console.log("Creating Audit Log", data);

    const log = await tx.auditLog.create({
      data: data,
    });
    console.log("Audit Log Created:", log);
    return log;
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
