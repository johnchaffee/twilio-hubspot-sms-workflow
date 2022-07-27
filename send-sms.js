/* 

 This code snippit can be used in a Hubspot Automation Workflow. 
 It calls the Twilio Messages API to send an SMS.
 
 Setup
 
 - Add Secrets to Workflow
   - AccountSID - from your Twilio Console
   - AuthToken - from your Twilio Console
   - TwilioSenderID - the Twilio phone number to send from

 - Add Properties to Workflow
   - Phone number
   - Mobile phone number
   - firstName and/or any other variables you want to include in the message body
 
 - Edit the template in the code below for the message body as desired. 
 
*/

// Load the axios library for sending HTTP request to the Twilio API
const axios = require("axios")

exports.main = async (event, callback) => {

  // Load environment variables that are stored as Secrets in Hubspot
  // These are required for the Twilio API
  const accountSID = process.env.AccountSID
  const authToken = process.env.AuthToken
  const fromPhoneNumber = process.env.TwilioSenderID

  // Evaluate the contact's mobilePhone and phone fields to determine the toPhoneNumber
  // Use the mobilePhone if it exists, otherwise use phone
  // TODO: This would be a good place to use Lookup to verify the phone is a mobile number
  const phone = event.inputFields["phone"]
  const mobilePhone = event.inputFields["mobilephone"]
  const toPhoneNumber = mobilePhone ? mobilePhone : phone

  // Define the template for the message body. It can include dynamic {{variables}} from fields in Hubspot
  // For each variable, make sure you add the corresponding property to the workflow during setup
  const template = "Hi {{firstname}}. This is a Twilio SMS message sent from a Hubspot Automation Workflow."

  // Create message body by replacing the template {{variables}} with the input fields of the same key
  const inputFields = event.inputFields;
  const body = template.replace(/{{([^}]+)}}/g, (match, key) => {
    return inputFields[key]
  })

  // Define the axios url, params and config headers
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSID}/Messages.json`
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

  // Send API request to Twilio via Axios
  const response = await axios.post(url, params, config)
  callback({
    outputFields: {
      MessageSid: response.data.sid,
      MessageStatus: response.data.status,
    },
  })
}
