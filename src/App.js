import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

const App = () => {
  const [ethAmount, setEthAmount] = useState("");
  const [tokensReceived, setTokensReceived] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [tokenCirculation, setTokenCirculation] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donors, setDonors] = useState([]);
  const [ethToTokenRate, setEthToTokenRate] = useState(""); // Input for how much 1 ETH equals in tokens

  // Load donors from local storage on page load
  useEffect(() => {
    const storedDonors = localStorage.getItem("donors");
    if (storedDonors) {
      setDonors(JSON.parse(storedDonors));
    }
  }, []);

  // Fetch live ETH price from CoinGecko
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        setEthPrice(data.ethereum.usd); // Store the price in state
      } catch (error) {
        console.error("Error fetching the ETH price:", error);
      }
    };

    fetchEthPrice();
  }, []); // Run only once when the component loads

  const calculateTokens = () => {
    if (ethAmount <= 0 || tokenCirculation <= 0 || ethToTokenRate <= 0) {
      alert(
        "Please enter valid ETH amount, token circulation, and ETH to Token rate."
      );
      return;
    }

    const tokens = ethAmount * ethToTokenRate;
    setTokensReceived(tokens);

    // Add donor to the list
    if (donorName) {
      const newDonor = { name: donorName, eth: ethAmount, tokens };
      const updatedDonors = [...donors, newDonor];
      setDonors(updatedDonors);
      localStorage.setItem("donors", JSON.stringify(updatedDonors)); // Save to local storage

      setDonorName("");
      setEthAmount("");
      setEthToTokenRate("");
    }
  };

  // Reset the donor list and clear local storage
  const resetDonors = () => {
    setDonors([]);
    localStorage.removeItem("donors");
    alert("Donor list has been reset.");
  };

  // Generate PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Donation Report", 10, 10);
    donors.forEach((donor, index) => {
      doc.text(
        `${index + 1}. ${donor.name} donated ${
          donor.eth
        } ETH and received ${donor.tokens.toLocaleString()} tokens.`,
        10,
        20 + index * 10
      );
    });
    doc.save("donation_report.pdf");
  };

  return (
    <div className="App">
      <h1 className="center">ETH Donation to Token Calculator</h1>

      {ethPrice ? (
        <p>Current ETH Price: ${ethPrice.toFixed(2)}</p>
      ) : (
        <p>Loading ETH price...</p>
      )}

      <input
        type="text"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
        placeholder="Enter your name"
      />
      <input
        type="number"
        value={ethAmount}
        onChange={(e) => setEthAmount(e.target.value)}
        placeholder="Enter ETH amount"
      />
      <input
        type="number"
        value={tokenCirculation}
        onChange={(e) => setTokenCirculation(e.target.value)}
        placeholder="Enter total token circulation"
      />
      <input
        type="number"
        value={ethToTokenRate}
        onChange={(e) => setEthToTokenRate(e.target.value)}
        placeholder="Enter how much 1 ETH equals in tokens"
      />
      <button onClick={calculateTokens}>Calculate Tokens</button>

      {ethToTokenRate > 0 && (
        <p>
          For 1 ETH, you will receive {ethToTokenRate.toLocaleString()} tokens.
        </p>
      )}

      {tokensReceived !== null && (
        <p>
          You will receive {tokensReceived.toLocaleString()} tokens for donating{" "}
          {ethAmount} ETH.
        </p>
      )}

      {ethAmount && ethPrice && (
        <p>
          Your {ethAmount} ETH donation is worth $
          {(ethAmount * ethPrice).toFixed(2)} USD.
        </p>
      )}

      <h2>Donor List:</h2>
      <ul style={{ margin: "10px", listStyle: "number" }}>
        {donors.map((donor, index) => (
          <li key={index}>
            {donor.name} donated {donor.eth} ETH and received{" "}
            {donor.tokens.toLocaleString()} tokens.
          </li>
        ))}
      </ul>

      <button style={{ margin: "10px" }} onClick={downloadPDF}>
        Download as PDF
      </button>
      <button onClick={resetDonors} style={{ margin: "10px", color: "red" }}>
        Reset Donor List
      </button>
    </div>
  );
};

export default App;
