module.exports = {
    name: `ready`,
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} e smecher si functioneste, e mai conectat decat prevede legea`);
    }
}