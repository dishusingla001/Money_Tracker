const API_KEY = "d927cdb02d9909b9700c7128"; // Replace with your API key from ExchangeRate-API or other service
const API_URL = `https://v6.exchangerate-api.com/v6/d927cdb02d9909b9700c7128/latest/USD`; 

function convertCurrency() {
    const inrAmount = document.getElementById('inr').value;
    
    if (!inrAmount) {
        alert('Please enter an amount in INR');
        return;
    }
    
    // Fetch data from the API
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (data.result === "success") {
                const exchangeRate = data.conversion_rates.USD;
                const usdAmount = inrAmount / 84.48;
                document.getElementById('usd').textContent = usdAmount.toFixed(2);
            }
            if (data.result === "success") {
                const exchangeRate = data.conversion_rates.EUR;
                const euroAmount = inrAmount / 91
                document.getElementById('euro').textContent = euroAmount.toFixed(2);
            }
             else {
                alert('Error fetching exchange rate');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch exchange rate');
        });
}


