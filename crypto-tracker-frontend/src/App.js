import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function App() {
    const [cryptoData, setCryptoData] = useState(null);
    const [error, setError] = useState(null);
    const [savedCryptos, setSavedCryptos] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/crypto');
                setCryptoData(response.data);
            } catch (error) {
                setError('Error fetching data');
            }
        };

        fetchData();
        fetchSavedCryptos();
    }, []);

    const saveCrypto = async (crypto) => {
        try {
            await addDoc(collection(db, 'cryptos'), { name: crypto });
            fetchSavedCryptos();
        } catch (e) {
            console.error('Error adding document: ', e);
        }
    };

    const fetchSavedCryptos = async () => {
        const querySnapshot = await getDocs(collection(db, 'cryptos'));
        const cryptos = querySnapshot.docs.map(doc => doc.data().name);
        setSavedCryptos(cryptos);
    };

    return (
        <div className="App">
            <h1>Crypto Tracker</h1>
            {error ? (
                <p>{error}</p>
            ) : cryptoData ? (
                <div>
                    <h2>Bitcoin: ${cryptoData.bitcoin.usd}</h2>
                    <h2>Ethereum: ${cryptoData.ethereum.usd}</h2>
                    <button onClick={() => saveCrypto('Bitcoin')}>Save Bitcoin</button>
                    <button onClick={() => saveCrypto('Ethereum')}>Save Ethereum</button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            <div>
                <h3>Saved Cryptos:</h3>
                <ul>
                    {savedCryptos.map((crypto, index) => (
                        <li key={index}>{crypto}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
