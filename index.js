
const core = require("@actions/core");
const fs = require("fs");
// const github = require("@actions/github");
require('dotenv').config();
const openai = require("openai");

const descriptions = core.getInput("descriptions") || process.env.descriptions;

const OPENAI_API_MODEL = core.getInput("OPENAI_API_MODEL") || process.env.OPENAI_API_MODEL;

const OPENAI_API_ORGANIZATION_ID = core.getInput("OPENAI_API_ORGANIZATION_ID") || process.env.OPENAI_API_ORGANIZATION_ID;

const OPENAI_API_PROJECT_ID = core.getInput("OPENAI_API_PROJECT_ID") || process.env.OPENAI_API_PROJECT_ID;

const OPENAI_API_TEMPERATURE = 0.5;

const OPENAI_API_TOKEN = core.getInput("OPENAI_API_TOKEN") || process.env.OPENAI_API_TOKEN;

function validateInputs() {
  let isError = false;
  const errors = [];

  if (!OPENAI_API_ORGANIZATION_ID) {
    errors.push('Missing OPENAI_API_ORGANIZATION_ID input');
    isError = true;
  }

  if (!OPENAI_API_PROJECT_ID) {
    errors.push('Missing OPENAI_API_PROJECT_ID input');
    isError = true;
  }

  if (!OPENAI_API_TOKEN) {
    errors.push('Missing OPENAI_API_TOKEN input');
    isError = true;
  }

  if (isError) {
    console.error("Input validation errors");
    for (error of errors) {
      console.error(error);
    }
    process.exit();
  }
}

function debugMessages() {
  console.debug("------------------------------------------------------------");
  console.debug("OPENAI_API_MODEL:");
  console.debug(OPENAI_API_MODEL);
  console.debug(" ");
  console.debug("Descriptions:");
  console.debug(descriptions);
  console.debug("------------------------------------------------------------");
}

async function generateFiles() {
  try {
    const _openai = new openai({
      apiKey: OPENAI_API_TOKEN,
      organization: OPENAI_API_ORGANIZATION_ID,
      project: OPENAI_API_PROJECT_ID,
      temperature: OPENAI_API_TEMPERATURE,
    });
  
    const completion = await _openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
            You are a very helpful developer. Your job is to write code. Your goal is to make code that is production ready.
            
            Your Task: 
            1. Stick to the descriptions provided below, don't add anything else.
            2. Use the minimum amount of required files.
            3. Make the minimum amount of assumptions about the rest of the repository.
            4. Provide the information as a compact, JSON-formatted array response.
            5. Each object should contain a 'filename' key, and the contents of the file should be in a 'content' key.
            
            Expected Output (in JSON format):
            [
              {
                "filename": "/blog-articles/YYYY-MM-DD-blog-article-title.md",
                "content": "# The title of the blog article\n\nThis is the introduction of the blog article.\n\n## This is a sub-heading\n\nThis is the content of the blog article.\n\n## Another sub-heading\n\nThis is the content of the blog article."
              },
              {
                "filename": "/src/write-file-to-disk.ts",
                "content": "import {writeFileSync} from 'fs'\n\nexport const writeFileSync = () => {};"
              },
              {
                "filename": "/multiple-numbers.php",
                "content": "<?php\n\n$a = 1;\n$b = 2;\n\nreturn $a + $b;"
              }
            ]

            Your descriptions are: ${descriptions}`,
        },
      ],
      model: OPENAI_API_MODEL,
      response_format: {
        type: "json_object",
      },
    });

    // console.log("Message", completion.choices[0].message);
    // console.log("Message", JSON.stringify(completion.choices[0].message));
  
    // // Output the list of files that were generated
    // const files = ["1.md", "2.md", "3.md"];
    // core.setOutput("files", files);
  
    //   // Get the JSON webhook payload for the event that triggered the workflow
    //   const payload = JSON.stringify(github.context.payload, undefined, 2)
    //   console.log(`The event payload: ${payload}`);

    const files = JSON.parse(completion.choices[0].message.content).response;
    console.debug("Files generated by OpenAI:")
    console.debug(files);
    return files;
  } catch (error) {
    core.setFailed(error.message);
  }
}

function writeFilesToRepository(files) {
  for (const file of files) {
    try {
      // File path
      let filePath = file.filename.substring(0, file.filename.lastIndexOf("/"));
      filePath = filePath.indexOf("/") === 0 ? filePath.substring(1) : filePath;
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      // File name
      const fileName = file.filename.substring(file.filename.lastIndexOf("/") + 1);

      // File content
      const filePathAndName = `${filePath}/${fileName}`;
      fs.writeFileSync(filePathAndName, file.content);
      console.debug("Written file:");
      console.debug(filePathAndName);
      console.debug(" ");
    } catch (error) {
      console.error(error);
      core.setFailed(error.message);
      process.exit();
    }
  }

  core.setOutput("files", files.map(file => file.filename).join("\n"));
}

async function run() {
  validateInputs();
  debugMessages();

  // const files = await generateFiles();
  // TODO: Validate the response is valid JSON and the response structure we're expecting
  // writeFilesToRepository(files);
  writeFilesToRepository([
    {
      filename: '/test/blog-articles/2024-10-14-importance-of-automated-testing.md',
      content: '# The Importance of Automated Testing\n' +
        '\n' +
        'Automated testing is a critical component of modern software development. It allows teams to run tests frequently and quickly, ensuring that the code performs as expected. One of the most significant advantages of automated testing is the ability to catch bugs early in the development cycle, saving time and resources. By implementing a robust testing framework, teams can facilitate continuous integration and continuous deployment (CI/CD). This process ensures that new code changes are automatically tested, reducing the risk of introducing defects. Moreover, automated tests can be executed repeatedly without additional effort, allowing developers to refocus their attention on creating new features rather than debugging. Overall, the value of automated testing cannot be overstated—it is essential for maintaining code quality and delivering reliable software products.'
    },
    {
      filename: '/test/blog-articles/2024-10-15-setting-up-a-great-testing-framework.md',
      content: '# Setting Up a Great Testing Framework\n' +
        '\n' +
        "Establishing a great testing framework is vital for successful software development. A well-structured testing framework enhances test case management and reduces code smell. First, it's essential to choose the right tools that align with the project’s tech stack. Popular frameworks like Jest, Mocha, or NUnit can provide strong support for various programming languages. Next, organizing test cases is crucial; they should mirror the application's structure for easy navigation. Additionally, it’s important to write clear and concise tests with meaningful names that describe their purpose. Incorporating practices like Test-Driven Development (TDD) can further strengthen the framework by promoting better design and preventing regression. In summary, a solid testing framework underpins the software quality and ensures a smooth development process."
    }
  ]);
}

run();