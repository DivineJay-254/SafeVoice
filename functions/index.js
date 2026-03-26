/**
 * Juasafety yako Cloud Functions
 * Deploy this file using `firebase deploy --only functions`
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
// const twilio = require("twilio"); // Uncomment if using real Twilio

admin.initializeApp();
const db = admin.firestore();

// --- CONFIGURATION ---
// In production, set these via: firebase functions:config:set gmail.email="..." gmail.password="..."
const GMAIL_EMAIL = functions.config().gmail?.email || "notifications@safevoice.org";
const GMAIL_PASSWORD = functions.config().gmail?.password || "your-app-password";

// Twilio Config
const TWILIO_SID = functions.config().twilio?.sid || "AC...";
const TWILIO_TOKEN = functions.config().twilio?.token || "token...";
const TWILIO_PHONE = functions.config().twilio?.phone || "+1234567890";

// const client = twilio(TWILIO_SID, TWILIO_TOKEN);

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD,
  },
});

/**
 * Trigger: When a report document is updated.
 * Goal: Check if 'assignedTo' changed, then notify the caseworker.
 */
exports.notifyCaseworkerAssignment = functions.firestore
  .document("reports/{reportId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Check if case was just assigned or reassigned
    if (newData.assignedTo && newData.assignedTo !== previousData.assignedTo) {
      const workerId = newData.assignedTo;
      const reportId = context.params.reportId;
      const trackingCode = newData.trackingCode;
      
      console.log(`Report ${reportId} assigned to ${workerId}. Fetching worker details...`);

      try {
        // Fetch Caseworker Details
        const workerDoc = await db.collection("caseworkers").doc(workerId).get();
        
        if (!workerDoc.exists) {
          console.error("Caseworker not found!");
          return null;
        }

        const worker = workerDoc.data();
        const workerEmail = worker.email;
        const workerPhone = worker.phone;

        // 1. Send Email
        const mailOptions = {
          from: `Juasafety yako Admin <${GMAIL_EMAIL}>`,
          to: workerEmail,
          subject: `[New Assignment] Case #${trackingCode}`,
          html: `
            <h3>New Case Assignment</h3>
            <p>Hello ${worker.name},</p>
            <p>You have been assigned to a new case.</p>
            <ul>
              <li><strong>Tracking Code:</strong> ${trackingCode}</li>
              <li><strong>Incident Type:</strong> ${newData.type}</li>
              <li><strong>Location:</strong> ${newData.location}</li>
              <li><strong>Date Reported:</strong> ${new Date(newData.createdAt).toLocaleString()}</li>
            </ul>
            <p>Please log in to the admin dashboard to review the evidence and take action.</p>
            <br/>
            <p>Juasafety yako Admin Team</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${workerEmail}`);

        // 2. Send SMS (Twilio) - Uncomment to enable
        /*
        await client.messages.create({
           body: `Juasafety yako Alert: You have been assigned Case #${trackingCode}. Type: ${newData.type}. Please check dashboard.`,
           from: TWILIO_PHONE,
           to: workerPhone
        });
        console.log(`SMS sent to ${workerPhone}`);
        */

      } catch (error) {
        console.error("Error sending notifications:", error);
      }
    }
    return null;
  });
