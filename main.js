const { ethers } = require('ethers');
const fs = require('fs');

const COLORS = {
  BOLD_YELLOW: '\x1b[1;33m',
  CYAN: '\x1b[36m',
  GREEN: '\x1b[32m',
  RESET: '\x1b[0m'
};

function centerAlignText(text, width) {
  const pad = Math.floor((width - text.length) / 2);
  return ' '.repeat(pad) + text + ' '.repeat(pad);
}

const consoleWidth = process.stdout.columns;

console.log("");
console.log(`${COLORS.BOLD_YELLOW}${centerAlignText("============================================", consoleWidth)}${COLORS.RESET}`);
console.log(`${COLORS.BOLD_YELLOW}${centerAlignText("Teanames.xyz Subdomain Minter", consoleWidth)}${COLORS.RESET}`);
console.log(`${COLORS.BOLD_YELLOW}${centerAlignText("github.com/recitativonika", consoleWidth)}${COLORS.RESET}`);
console.log(`${COLORS.BOLD_YELLOW}${centerAlignText("============================================", consoleWidth)}${COLORS.RESET}`);
console.log("");

// Load private key
const privateKey = fs.readFileSync('priv.txt', 'utf8').trim();

// Configure blockchain provider
const provider = new ethers.JsonRpcProvider('https://assam-rpc.tea.xyz');
const wallet = new ethers.Wallet(privateKey, provider);

// Contract details
const contractAddress = '0x09B42372ac4b4439A25601f7Db655453DB59ec20';
const contractABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "subdomain", "type": "string" },
      { "name": "mainDomain", "type": "string" }
    ],
    "name": "mintSubdomain",
    "outputs": [],
    "type": "function"
  }
];

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Mint subdomains
async function mintTeanamesSubdomains() {
  const address = wallet.address;

  // Load main domain
  const mainDomain = fs.readFileSync('maindomain.txt', 'utf8').trim();

  if (!mainDomain) {
    console.error('Invalid or missing domain in maindomain.txt');
    return;
  }

  // Load subdomains
  const subContent = fs.readFileSync('sub.txt', 'utf8').trim();
  const subdomainsFromFile = subContent.split('\n').map(sub => sub.trim()).filter(sub => sub);

  if (subdomainsFromFile.length === 0) {
    console.error('No subdomains found in sub.txt');
    return;
  }

  for (const subdomain of subdomainsFromFile) {
    console.log(`Minting subdomain: ${COLORS.CYAN}${subdomain}.${mainDomain}${COLORS.RESET}`);
    try {
      const tx = await contract.mintSubdomain(address, subdomain, mainDomain);
      const receipt = await tx.wait();
      console.log(`${COLORS.GREEN}Successfully minted subdomain: ${subdomain}.${mainDomain}${COLORS.RESET}`);
      console.log(`${COLORS.GREEN}Transaction hash: https://explorer.tea.xyz/tx/${receipt.transactionHash}${COLORS.RESET}`);
    } catch (error) {
      console.error(`Failed to mint subdomain: ${subdomain}.${mainDomain}`);
      console.error(`Error: ${error.message}`);
    }
  }
}

mintTeanamesSubdomains();
