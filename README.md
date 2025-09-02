# RemitXpress

A secure, fast, and affordable international money transfer platform powered by blockchain technology.

> 📚 **Documentation**: All detailed project documentation can be found in the [`documentation/`](./documentation/) folder.

## 🚀 Features

- **Lightning Fast Transfers**: Complete transactions in minutes, not days
- **Bank-Level Security**: Military-grade encryption, 2FA, and advanced fraud detection
- **Lowest Fees**: Save up to 90% compared to traditional banks
- **Global Reach**: Send money to 200+ countries
- **Multi-Currency Support**: USD, EUR, GBP, ETH, USDT, USDC
- **KYC/AML Compliance**: Built-in compliance with regulatory requirements
- **Real-time Tracking**: Live transaction status updates
- **Admin Dashboard**: Comprehensive management and compliance tools

## 🏗️ Architecture

```
remitxpress/
├── client/          # React frontend application
├── server/          # Node.js backend API
├── contracts/       # Solidity smart contracts
├── scripts/         # Deployment and automation scripts
└── documentation/   # Project documentation
```

### Technology Stack

**Frontend:**

- React 18 with TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- React Query for data fetching
- Ethers.js for blockchain interaction

**Backend:**

- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication with refresh tokens
- Argon2 for password hashing
- Redis for rate limiting
- Winston for logging

**Blockchain:**

- Solidity smart contracts
- Hardhat development environment
- OpenZeppelin security libraries
- Multi-signature wallet support

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+
- Git

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/remitxpress.git
   cd remitxpress
   ```

2. **Install dependencies**

   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install

   # Smart Contracts
   cd ../contracts
   npm install
   ```

3. **Environment Configuration**

   ```bash
   # Copy environment files
   cp server/.env.example server/.env

   # Edit the .env file with your configuration
   nano server/.env
   ```

4. **Database Setup**

   ```bash
   # Start MongoDB and Redis
   sudo systemctl start mongodb
   sudo systemctl start redis
   ```

5. **Smart Contract Deployment**

   ```bash
   cd contracts
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Start Development Servers**

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm start

   # Terminal 3 - Hardhat Node (optional)
   cd contracts
   npx hardhat node
   ```

## 🔧 Configuration

### Environment Variables

**Server (.env):**

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/remitxpress
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key
```

### Database Indexes

```javascript
// MongoDB indexes for optimal performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true });
db.transactions.createIndex({ sender: 1, createdAt: -1 });
db.transactions.createIndex({ transactionId: 1 }, { unique: true });
db.transactions.createIndex({ status: 1 });
```

## 🚀 Deployment

### Production Deployment

1. **Build Applications**

   ```bash
   cd client && npm run build
   cd ../server && npm run build  # if using TypeScript
   ```

2. **Docker Deployment**

   ```bash
   docker-compose up -d
   ```

3. **Smart Contract Deployment**
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network mainnet
   npx hardhat verify CONTRACT_ADDRESS --network mainnet
   ```

### Security Checklist

- [ ] Enable HTTPS/TLS 1.3
- [ ] Configure CSP headers
- [ ] Set up rate limiting
- [ ] Enable 2FA for admin accounts
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging
- [ ] Configure backup systems

## 📖 API Documentation

### Authentication Endpoints

```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/verify-2fa   # 2FA verification
POST /api/auth/logout       # User logout
```

### Remittance Endpoints

```
GET  /api/remit/rates           # Get exchange rates
POST /api/remit/calculate-fees  # Calculate transaction fees
POST /api/remit/send           # Send money
GET  /api/remit/history        # Transaction history
GET  /api/remit/transaction/:id # Transaction details
```

### User Management

```
GET    /api/user/profile      # Get user profile
PATCH  /api/user/profile      # Update profile
POST   /api/user/kyc          # Submit KYC documents
GET    /api/user/kyc/status   # Check KYC status
```

## 🔒 Security Features

### Authentication & Authorization

- JWT with short expiry + refresh tokens
- Argon2id password hashing
- 2FA with TOTP
- Device fingerprinting
- Session management

### Transaction Security

- Multi-signature wallets
- Risk scoring engine
- AML/KYC compliance
- Fraud detection
- Transaction monitoring

### Infrastructure Security

- Rate limiting and DDoS protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection with CSP
- HTTPS enforcement

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Smart contract tests
cd contracts && npx hardhat test
```

### Test Coverage

```bash
# Generate coverage reports
npm run test:coverage
```

## 📊 Monitoring

### Metrics & Logging

- Application performance monitoring
- Transaction success rates
- Error tracking and alerting
- User activity analytics
- Security event monitoring

### Health Checks

- Database connectivity
- External API availability
- Blockchain node status
- Cache performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ESLint and Prettier for JavaScript/TypeScript
- Follow Solidity style guide for smart contracts
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [docs.remitxpress.com](https://docs.remitxpress.com)
- Support Email: support@remitxpress.com
- Discord: [RemitXpress Community](https://discord.gg/remitxpress)

## 🗺️ Roadmap

### Phase 1 (Current)

- [x] Core remittance functionality
- [x] KYC/AML compliance
- [x] Multi-currency support
- [x] Admin dashboard

### Phase 2 (Q2 2025)

- [ ] Mobile applications
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Phase 3 (Q3 2025)

- [ ] DeFi protocol integration
- [ ] Staking rewards program
- [ ] Cross-chain compatibility
- [ ] AI-powered fraud detection

---

**RemitXpress** - Making global money transfers simple, secure, and affordable. 🌍💰
