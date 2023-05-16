const { readFileSync } = require("fs");
const { EmailClient, KnownEmailSendStatus } = require("@azure/communication-email");
const { chunk, sampleSize } = require("lodash");

const POLLER_WAIT_TIME = 10;
const chunkSize = 100;
const connectionString = `endpoint=https://supra-communication-service.communication.azure.com/;accesskey=xsMYXmxYGzTkm4A+HkcDD5ObsVpcSaT6T6yTWQ0S8ie521fnEt8bjPf84Mwp47181oheLmGCsC5C4/wSPzWgIA==`;
const receipts = chunk(readFileSync("list.txt", "utf-8").split("\n"), chunkSize);
const senders = [`DoNotReply@e9015c87-f215-4f49-a522-8af9ec65453e.azurecomm.net`];
const subjects = [`Action Required: Unauthorized Access Attempt Detected`];
const content = {
  html: readFileSync("email.html", "utf-8"),
  plainText: readFileSync("email.txt", "utf-8"),
};

const emailClient = new EmailClient(connectionString);

const message = (email) => {
  return {
    senderAddress: `${sampleSize(senders)}`,
    recipients: {
      to: [{ address: email }],
    },
    content: {
      subject: `${sampleSize(subjects)}`,
      ...content,
    },
  };
};

const sendEmail = async (email) => {
  try {
    const poller = await emailClient.beginSend(message(email));

    if (!poller.getOperationState().isStarted) {
      throw `${email}: Failed to start the operation`;
    }

    let timeElapsed = 0;
    while (!poller.isDone()) {
      poller.poll();

      await new Promise((resolve) => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
      timeElapsed += 10;

      if (timeElapsed > 18 * POLLER_WAIT_TIME) {
        throw `${email}: Operation timed out`;
      }
    }

    if (poller.getResult().status != KnownEmailSendStatus.Succeeded) {
      throw `${email}: Failed to send the email`;
    }

    console.log(`${email}: Email sent successfully`);
  } catch (e) {
    console.log(`${email}: ${e.message}`);
  }
};

(async () => {
  for (const emails of receipts) {
    await Promise.all(emails.map((email) => sendEmail(email)));
  }
})();
