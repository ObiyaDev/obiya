import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

export const setupDocker = async (): Promise<void> => {
  console.log(
    '\n\n' +
      `
    ___      ___     ______  ___________  __          __           
    |"  \    /"  |   /    " \("     _   ")|" \        /""\          
     \   \  //   |  // ____  \)__/  \\__/ ||  |      /    \         
     /\\  \/.    | /  /    ) :)  \\_ /    |:  |     /' /\  \        
    |: \.        |(: (____/ //   |.  |    |.  |    //  __'  \       
    |.  \    /:  | \        /    \:  |    /\  |\  /   /  \\  \      
    |___|\__/|___|  \"_____/      \__|   (__\_|_)(___/    \___)     
                                                                    
     ________      ______    ______   __   ___  _______   _______   
    |"      "\    /    " \  /" _  "\ |/"| /  ")/"     "| /"      \  
    (.  ___  :)  // ____  \(: ( \___)(: |/   /(: ______)|:        | 
    |: \   ) || /  /    ) :)\/ \     |    __/  \/    |  |_____/   ) 
    (| (___\ ||(: (____/ // //  \ _  (// _  \  // ___)_  //      /  
    |:       :) \        / (:   _) \ |: | \  \(:      "||:  __   \  
    (________/   \"_____/   \_______)(__|  \__)\_______)|__|  \___) 

    ` +
      '\n\n',
  )

  // Check if Dockerfile already exists in current directory
  const dockerfilePath = path.join(process.cwd(), 'Dockerfile')

  if (fs.existsSync(dockerfilePath)) {
    console.log('Dockerfile already exists')

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const shouldOverride = await new Promise<boolean>((resolve) => {
      rl.question('Do you want to override the existing Dockerfile? (y/N): ', (answer) => {
        rl.close()
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
      })
    })

    if (!shouldOverride) {
      console.log('Dockerfile generation cancelled')
      return
    }
  }

  // Dockerfile content as specified
  const dockerfileContent = `# Specify platform to match your target architecture
FROM --platform=linux/arm64 motiadev/motia-docker:latest

# Install Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Move application files
COPY . .

# Enable the following lines if you are using python steps!!!
# # Setup python steps dependencies
# RUN npx motia@latest install

# Expose outside access to the motia project
EXPOSE 3000

# Run your application
CMD ["npm", "run", "start"]
`

  // Write the Dockerfile
  try {
    fs.writeFileSync(dockerfilePath, dockerfileContent)
    console.log('Dockerfile generated successfully!')
  } catch (error) {
    console.error('Error generating Dockerfile:', (error as Error).message)
    throw error
  }

  // Write .dockerignore
  const dockerignoreContent = `# Git
.git
.gitignore

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/

# Node
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# Local development
.env

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`

  // Check if Dockerfile already exists in current directory
  const dockerignorePath = path.join(process.cwd(), '.dockerignore')

  if (fs.existsSync(dockerignorePath)) {
    console.log('.dockerignore already exists')

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const shouldOverride = await new Promise<boolean>((resolve) => {
      rl.question('Do you want to override the existing .dockerignore? (y/N): ', (answer) => {
        rl.close()
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
      })
    })

    if (!shouldOverride) {
      console.log('.dockerignore generation cancelled')
      return
    }
  }

  // Write the .dockerignore
  try {
    fs.writeFileSync(dockerignorePath, dockerignoreContent)
    console.log('.dockerignore generated successfully!')
  } catch (error) {
    console.error('Error generating .dockerignore:', (error as Error).message)
    throw error
  }
}
