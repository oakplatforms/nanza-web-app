/* eslint-disable */
// This file contains the Amplify configuration and is committed to the repository
// It's a copy of aws-exports.js which is gitignored

const amplifyConfig = {
  aws_project_region: "us-east-1",
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_KKItc8m0F",
  aws_user_pools_web_client_id: "2q09jrcj5o7eqlmc4cf4biulk3",
  oauth: {},
  aws_cognito_username_attributes: [
    "EMAIL"
  ],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: [
    "EMAIL"
  ],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: [
    "SMS"
  ],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: [
    "EMAIL"
  ]
};

export default amplifyConfig;

