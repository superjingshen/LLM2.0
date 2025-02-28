# Chat Application Project

## I. Project Overview
This project is a React-based frontend chat application designed to provide users with an efficient and convenient interactive experience. The project uses a modern technology stack, including the Remix framework, TailwindCSS, etc., and integrates the Coze API to provide stable and reliable chat services.

English | [简体中文](./README.md)

## II. Main Features
1. **File Upload**: Supports uploading various types of files to meet different business needs.

2. **Image Upload**: Provides convenient image upload functionality, making it easy for users to share and display image content.

3. **Multiple Return Formats**:
   - Supports Markdown format output for document editing and display
   - Supports image generation, providing a richer visual experience
   - Provides question suggestion functionality to help users better interact with the system

4. **Streaming Output**: Implements streaming data transmission, improving data transfer efficiency and allowing users to get results faster.

5. **Request Prefix Switching**: Supports switching request prefixes between `coze.com` and `coze.cn` to meet the access needs of different users.

6. **Coze API Integration**: The project has fully integrated the Coze API, providing stable and reliable service support.

7. **Authentication Methods**:
   - Supports personal authentication
   - Supports OAuth PKCE authentication
   Ensuring the security of user data

## III. Technical Features
1. **Modern Technology Stack**:
   - Uses React as the core framework
   - Uses Remix as the build tool
   - Uses TailwindCSS for style management
   - Integrates multiple useful React component libraries

2. **Excellent User Experience**:
   - Responsive design
   - Smooth interaction experience
   - Supports dark/light theme switching

## IV. Quick Start

### Requirements
- Node.js 16.x or higher
- npm 7.x or higher

### Installation and Running

1. Clone the project:
```bash
git clone https://github.com/your-username/byte-dance-chat.git
cd byte-dance-chat
```

2. Install dependencies:
```bash
npm install
```

3. Run in development environment:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Start the service:
```bash
npm start
```

### Configure Environment Variables
Create a `.env` file in the project root directory and add the necessary environment variables:
```
PERSONAL_ACCESS_TOKEN=your_token_here
BOT_ID=your_bot_id_here
```

## V. Configuration Instructions

### Authentication Methods
1. **Personal Authentication**
   - Requires Personal Access Token and Bot ID
   - Personal Access Token can be obtained from the Coze developer page
   - Bot ID can be obtained from the URL of the bot development page, format: https://www.coze.cn/space/xxxx/bot/[bot_id]

2. **OAuth PKCE Authentication**
   - Requires Client ID and Bot ID
   - Requires creating an OAuth application on the Coze platform and setting a callback address
   - Supports automatic token refresh

### API Calls
1. **Interface Address**
   - Uses https://www.coze.cn/ by default
   - Supports switching to https://www.coze.com/

2. **Call Format**
   ```
   POST https://api.coze.cn/v3/chat
   ```

### Security Notes
- All authentication information is only saved locally and will not be uploaded to the server
- It is recommended to properly safeguard sensitive information such as tokens
- It is recommended to update tokens regularly

## VI. Project Structure
```
/
├── app/                # Application source code
│   ├── apis/          # API interfaces
│   ├── components/    # Components
│   ├── hooks/         # React Hooks
│   ├── lib/           # Utility libraries
│   ├── routes/        # Routes
│   ├── store/         # State management
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static resources
└── ...                # Configuration files
```

## VII. Contribution Guidelines
1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## VIII. Feedback
If you encounter any issues during use, please provide feedback through the following methods:
1. Submit an Issue in the GitHub repository
2. Send an email to the project maintainer

## IX. License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
