/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMysqlServer'
  // },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  // port: 80,

  /***************************************************************************
   * Set the log level in production environment                             *
   ***************************************************************************/
  log: {
    level: "silent"
  },
  /***************************************************************************
   *                                                                         *
   * NEEEDO Services                                                         *
   *                                                                         *
   ***************************************************************************/
  neeedo: {
    // URL to production neeedo-ap
    apiClient : {
      apiUrls: {
        // http fallback, used by GET images for example
        http: 'http://localhost',
        // be aware that https will be used first - set to undefined if you do not want to use it (not recommended)
        https: 'http://localhost'
      },
      debugMode: false,
      security: {
        https : {
          // whether to allow self-signed TLS certificates
          allow_self_signed_cert : true
        }
      }
    }
  },
  // session invalidation time
  session: {
    cookie: {
      maxAge: 10 * 60 * 1000
    }
  }
};
