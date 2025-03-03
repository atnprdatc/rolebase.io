import * as dotenv from 'dotenv'
dotenv.config()

const isLocal = process.env.NHOST_ADMIN_SECRET === 'nhost-admin-secret'

export default {
  isLocal,
  url: isLocal ? 'http://localhost:3000' : 'https://rolebase.actinvision.com',
  storageUrl: isLocal
    ? 'http://localhost:1337/v1/storage/files/'
    : 'https://qeljszoxpnphnuxgbped.storage.eu-central-1.nhost.run/v1/files/',

  forbiddenSlugs: [
    'admin',
    'signup',
    'signin',
    'login',
    'logout',
    'profile',
    'settings',
    'reset-password',
    'user-info',
    'www',
    'backoffice',
    'orgs',
    'members',
    'threads',
    'meetings',
    'meetings-recurring',
    'subscription',
    'meetings',
    'tasks',
    'decisions',
    'logs',
    'import',
  ],

  mail: {
    sender: {
      name: 'Rolebase Actinvision',
      email: 'rolebase@actinvision.com',
    },
  },

  mailjet: {
    public: process.env.MAILJET_PUBIC_KEY || '',
    private: process.env.MAILJET_PRIVATE_KEY || '',
  },

  security: {
    invitation_token: process.env.SECURITY_INVITATION_TOKEN || '',
  },

  // Search with Algolia
  algolia: {
    appId: process.env.ALGOLIA_APP_ID || '',
    searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY || '',
    adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY || '',
    indexName: 'docs',
  },

  // Notification with Novu
  novu: {
    appId: process.env.NOVU_APP_ID || '',
    apiKey: process.env.NOVU_API_KEY || '',
  },
}
