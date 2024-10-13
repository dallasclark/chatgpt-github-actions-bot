
const core = require("@actions/core");
const github = require("@actions/github");
const openai = require("openai");

async function run() {
  try {
    // `descriptions` input defined in action metadata file
    const descriptions = core.getInput("descriptions");
    console.log(`Descriptions: ${descriptions}`);
  
    const _openai = new openai({
      apiKey: core.getInput("OPENAI_API_TOKEN"),
      organization: core.getInput("OPENAI_API_ORGANIZATION_ID"),
      project: core.getInput("OPENAI_API_PROJECT_ID"),
    });
  
    const completion = await _openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a very helpful developer. Your job is to write code.`,
        },
        {
          role: "system",
          content: `Your goal is to make code that is production ready. Stick to the description provided, don't add anything else. Use the minimum amount of required files.`,
        },
        {
          role: "system",
          content: `Make the minimum amount of assumptions about the rest of the repo.`,
        },
        {
          role: "system",
          content: `Provide the information as a compact, JSON-formatted dictionary where the keys are file paths (not directories, just files!) and the values are the descriptions strings.`,
        },
        {
          role: "user",
          content: `Write code using the following descriptions: ${descriptions}.`,
        },
      ],
      model: "gpt-4o-mini"
    });
  
    // console.log(completion.choices[0].message);
    console.log("Completion", completion);
  
    // Output the list of files that were generated
    const files = ["1.md", "2.md", "3.md"];
    core.setOutput("files", files);
  
    //   // Get the JSON webhook payload for the event that triggered the workflow
    //   const payload = JSON.stringify(github.context.payload, undefined, 2)
    //   console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();