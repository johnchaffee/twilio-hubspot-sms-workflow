const axios = require("axios")
exports.main = async (event, callback) => {
  const accountSID = process.env.AccountSID
  const authToken = process.env.AuthToken
  const fromPhoneNumber = process.env.TwilioSenderID
  const firstName = event.inputFields["firstname"]
  const phone = event.inputFields["phone"]
  const mobilePhone = event.inputFields["mobilephone"]
  // Use mobilePhone as the toPhoneNumber if available, otherwise use phone
  const toPhoneNumber = mobilePhone ? mobilePhone : phone
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSID}/Messages.json`
  const body = `Hi ${firstName}. This is a Twilio SMS message sent from a Hubspot Automation Workflow.`
  const params = new URLSearchParams()
  params.append("From", fromPhoneNumber)
  params.append("To", toPhoneNumber)
  params.append("Body", body)
  const config = {
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${accountSID}:${authToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }
  const response = await axios.post(url, params, config)
  callback({
    outputFields: {
      MessageSid: response.data.sid,
      MessageStatus: response.data.status,
    },
  })
}
