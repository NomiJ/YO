module.exports = {

    port: 8000,

    appName:"YO",

    db: process.env.MONGODB || 'mongodb://localhost:27017/yo', //mongodb://user:111111@ds039860.mongolab.com:39860/user-management

    sessionExpire: 60*24*30, // In minutes

    sms: {
        server: 'api.sendsms.pk',
        path:'sendsms/88b84aa97cb75d207716.json',
        defaultHttpPort: 80,
        defaultHttpsPort: 443
    },

    secret: "SeCrEtOfYO"
};
