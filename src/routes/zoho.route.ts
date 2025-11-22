import { Router } from "express";
import { asyncHandler } from "../modules/common/errorHandlers";
import { storage } from "../storage";

const router = Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { zohoCRM } = await import("../services/zoho.service");

    if (!zohoCRM.isConfigured()) {
      return res.status(400).json({
        error: "Zoho CRM not configured. Please add credentials in Secrets.",
      });
    }

    const contactIds = req.body.contactIds as string[] | undefined;
    let contacts;

    if (contactIds && contactIds.length > 0) {
      // Sync specific contacts
      const contactPromises = await Promise.all(
        contactIds.map((id) => storage.getContactById(id))
      );
      contacts = contactPromises.filter(
        (c): c is NonNullable<typeof c> => c !== null
      );
    } else {
      // Sync all contacts
      contacts = await storage.getAllContacts();
    }

    const result = await zohoCRM.createLeads(contacts);

    res.json({
      message: `Synced ${result.success} contacts successfully, ${result.failed} failed`,
      success: result.success,
      failed: result.failed,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  })
);

export default router;
