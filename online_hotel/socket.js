// const socketIo = require('socket.io');

// let io;
// const connectedPartners = new Map();

// const initializeSocket = (server) => {
//     io = socketIo(server, {
//         cors: {
//             origin: "*", // Adjust this to match your frontend domain
//         }
//     });

//     io.on('connection', (socket) => {
//         console.log('A partner connected:', socket.id);

//         // When a partner logs in, associate them with their partnerId
//         // socket.on('registerPartner', (partnerId) => {
//         //     connectedPartners.set(partnerId, socket);
//         //     console.log(`Partner ${partnerId} registered.`);
//         // });
//         socket.on('registerPartner', (partnerId) => {
//             connectedPartners.set(partnerId, socket);
//             console.log(`Partner ${partnerId} registered.`);
            
//             // Send confirmation to the frontend
//             socket.emit('partnerRegistered', `Partner ${partnerId} successfully registered.`);
//         });
        

//         // Handle disconnections
//         socket.on('disconnect', () => {
//             connectedPartners.forEach((value, key) => {
//                 if (value === socket) {
//                     connectedPartners.delete(key);
//                     console.log(`Partner ${key} disconnected.`);
//                 }
//             });
//         });
//     });
// };

// const getIo = () => {
//     if (!io) {
//         throw new Error("Socket.IO not initialized");
//     }
//     return io;
// };

// module.exports = { initializeSocket, getIo, connectedPartners };


const socketIo = require('socket.io');

let io;
const connectedPartners = new Map();
const pendingOrders = new Map(); // Add this to store queued orders

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Adjust this to match your frontend domain
        }
    });

    io.on('connection', (socket) => {
        console.log('A partner connected:', socket.id);

        // Register partner with their ID
        socket.on('registerPartner', (partnerId) => {
            connectedPartners.set(partnerId, socket);
            console.log(`Partner ${partnerId} registered.`);

            // Confirm registration
            socket.emit('partnerRegistered', `Partner ${partnerId} successfully registered.`);

            // Check for any stored (queued) orders
            const queuedOrders = pendingOrders.get(partnerId);
            if (queuedOrders && queuedOrders.length > 0) {
                queuedOrders.forEach(order => {
                    socket.emit('newOrder', {
                        orderId: order.orderId,
                        orderDetails: order.orderDetails,
                        queued: true
                    });
                });
                console.log(`Queued orders found for partner ${partnerId}:`, queuedOrders);

                pendingOrders.delete(partnerId); // Clear after sending
            }
        });

        // Handle disconnections
        socket.on('disconnect', () => {
            connectedPartners.forEach((value, key) => {
                if (value === socket) {
                    connectedPartners.delete(key);
                    console.log(`Partner ${key} disconnected.`);
                }
            });
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};

// Export pendingOrders too if used externally (optional)
module.exports = { initializeSocket, getIo, connectedPartners, pendingOrders };
