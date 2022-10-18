import fs from 'fs';
import got from 'got';
/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */
async function validateEmailAddresses(inputPath: string[], outputFile: string) {
  let emailString = '';
  let emailArray: string[] = [];
  const validEmails: string[] = [];
  const validDomainArray: string[] = [];
  let emailsWithValidDomains = '';
  for (let i = 0; i < inputPath.length; i++) {
    try {
      const data = fs.createReadStream(inputPath[i]);
      for await (const chunk of data) {
        emailString += chunk;
      }
      emailString = emailString.toString();
      emailArray = emailString.split('\n');
    } catch (error) {
      console.log(error);
    }
    for (const item of emailArray) {
      if (validateEmail(item)) {
        validEmails.push(item);
      }
    }
    for (const item of validEmails) {
      const domain = item.split('@')[1];
      const url = `https://dns.google.com/resolve?name=${domain}&type=MX`;
      const response = await got(url);
      const result = JSON.parse(response.body);
      if (result.Answer && !validDomainArray.includes(domain)) {
        validDomainArray.push(domain);
        const realEmail = `${item}\n`;
        // console.log(realEmail);
        emailsWithValidDomains += realEmail;
      }
    }
    // console.log(emailsWithValidDomains);
    const writerStream = fs.createWriteStream(outputFile);
    writerStream.write(emailsWithValidDomains, 'utf8');
    writerStream.end;
    writerStream.on('finish', function () {
      console.log('Write completed.');
    });
    writerStream.on('error', function (err) {
      console.log(err.message);
    });
  }
}
function validateEmail(email: string): boolean {
  // check for @ sign
  const atSymbol = email.indexOf('@');
  if (atSymbol < 1) return false;
  const dot = email.indexOf('.');
  if (dot <= atSymbol + 2) return false;
  // check that the dot is not at the end
  if (dot === email.length - 1) return false;
  const parts = email.split('@');
  const dotSplits = parts[1].split('.');
  const dotCount = dotSplits.length - 1;
  // Check whether Dot is present, and that too minimum 1 character after @.
  if (dotCount > 1) {
    return false;
  }
  return true;
  // console.log('Complete the implementation in src/validation.ts');
}
export default validateEmailAddresses;



// /**
//  * First task - Read the csv files in the inputPath and analyse them
//  *
//  * @param {string[]} inputPaths An array of csv files to read
//  * @param {string} outputPath The path to output the analysis
//  */

//  import fs from 'fs';
//  async function analyseFiles(inputPaths: string[], outputPath: string) {
//    const test = fs.createReadStream(inputPaths[0], { encoding: 'utf-8' });
//    //to extract the email addresses and store in empty string('data')
//    let data = '';
//    for await (const tests of test) {
//      data += tests;
//    }
//    const newData = data.trim().split('\n');
//    newData.shift();
//    const length = newData.length;
 
 
//    //validating the emails
//    const filteredEmail: Array<string> = [];
//    const regx = new RegExp(
//      /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
//    );
//    for (let i = 0; i < newData.length; i++) {
//      if (regx.test(newData[i])) {
//        filteredEmail.push(newData[i]);
//      }
//    }
//    const length2 = filteredEmail.length;
//    //to extract the domain name
//    const validDomainNames: string[] = [];
//    for (const elem of filteredEmail) {
//      const domains = elem.split('@')[1];
//      validDomainNames.push(domains);
//    }
//    //to get the count of each domain name
//    const domainCount: { [key: string]: number } = {};
//    for (const i of validDomainNames) {
//      if (domainCount[i]) {
//        domainCount[i]++;
//      } else {
//        domainCount[i] = 1;
//      }
//    }
 
//    //collate my data
//    const finalOutput: Record<string, unknown> = {
//      ' valid-domains': validDomainNames,
//      ' totalEmailsParsed': length,
//      ' totalValidEmails': length2,
//      ' categories': domainCount,
//    };
 
//    //write files into the output
//    const writeStream = JSON.stringify(finalOutput, null, 2);
//    fs.writeFile(outputPath, writeStream, (err) => err);
//    // console.log('Complete the implementation in src/analysis.ts');
//  }
//  //console.log(analyseFiles(['./fixtures/inputs/medium-sample.csv'], ''));
//  export default analyseFiles;