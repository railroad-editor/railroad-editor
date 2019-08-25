const SIGN_UP_CONFIRMATION_URL = {
  test: 'https://vt19i26223.execute-api.ap-northeast-1.amazonaws.com/test/confirm',
  prod: 'https://vt19i26223.execute-api.ap-northeast-1.amazonaws.com/prod/confirm',
}

const RESET_PASSWORD_REDIRECT_URL = {
  test: 'http://localhost:3000/reset-password',
  prod: 'https://dcenny7deo578.cloudfront.net/reset-password'
}

exports.handler = async (event) => {
  console.info('EVENT:IN', event)

  switch (event.triggerSource) {
    case 'CustomMessage_SignUp':
      handleSignUp(event)
      break;
    case 'CustomMessage_ForgotPassword':
      handleForgotPassword(event)
      break
  }

  console.info('EVENT:OUT', event)
  return event
};

const handleSignUp = (event) => {
  const url = SIGN_UP_CONFIRMATION_URL[process.env.ENV]
  const clientId = event.callerContext.clientId
  const userName = event.userName
  const codeParameter = event.request.codeParameter

  event.response.emailSubject = "Welcome to Railroad Editor!";
  const link = `<a href=${url}?client_id=${clientId}&user_name=${userName}&confirmation_code=${codeParameter}>here</a>`
  event.response.emailMessage = `Click ${link} to finish registration.`
}


const handleForgotPassword = (event) => {
  const url = RESET_PASSWORD_REDIRECT_URL[process.env.ENV]
  const clientId = event.callerContext.clientId
  const userName = event.userName
  const codeParameter = event.request.codeParameter

  event.response.emailSubject = "Railroad Editor - Reset password"
  const link = `<a href=${url}?client_id=${clientId}&user_name=${userName}&confirmation_code=${codeParameter}>here</a>`
  event.response.emailMessage = `Click ${link} to reset password.`
}