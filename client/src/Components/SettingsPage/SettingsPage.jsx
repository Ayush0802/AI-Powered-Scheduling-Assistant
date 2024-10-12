import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SettingsPage.module.css';
import Navbar from "../Navbar/Navbar";
import bgimg from '../../assets/bg.jpg';

const SettingsPage = () => {
    const [fonts, setFonts] = useState([]); // Store the font list
    const [selectedFont, setSelectedFont] = useState(''); // Store the selected font
    const [fontSize, setFontSize] = useState('16px'); // Store the selected font size

    // Set background image
    useEffect(() => {
        document.body.style.backgroundImage = `url(${bgimg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';

        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
        };
    }, [bgimg]);

    const GOOGLE_FONT_API_KEY = import.meta.env.VITE_GOOGLE_FONT_API_KEY;

    // Fetch Google Fonts from API
    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const response = await axios.get(
                    `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONT_API_KEY}`
                );
                setFonts(response.data.items);
            } catch (error) {
                console.error('Error fetching Google Fonts:', error);
            }
        };
        fetchFonts();
    }, []);

    // Handle font selection and dynamically load the selected font
    const handleFontChange = (e) => {
        const selectedFontFamily = e.target.value;
        setSelectedFont(selectedFontFamily);

        // Dynamically load the selected Google Font
        if (selectedFontFamily) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${selectedFontFamily.replace(/ /g, '+')}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            // Apply the selected font globally
            document.body.style.fontFamily = `${selectedFontFamily}`;
        }
    };

    // Handle font size selection
    const handleFontSizeChange = (e) => {
        const selectedSize = e.target.value;
        setFontSize(selectedSize);
        document.body.style.fontSize = selectedSize; // Apply selected font size globally
    };

    // Available font sizes
    const fontSizes = ['12px', '14px', '16px', '18px', '20px','22px', '24px', '26px', '28px','30px', '32px'];

    // Fetch the current font and size from the document body
    const getCurrentFontAndSize = () => {
        const computedStyle = getComputedStyle(document.body);
        return {
            font: computedStyle.fontFamily,
            size: computedStyle.fontSize,
        };
    };

    const { font: currentFont, size: currentSize } = getCurrentFontAndSize();

    return (
        <>
            <Navbar />
            <div className={styles.settingspage} style={{ padding: '20px', fontFamily: selectedFont, fontSize: fontSize }}>
                <h1 style={{ fontFamily: selectedFont }}>Settings</h1>
                <div>
                    <label htmlFor="font-select" style={{ marginRight: '10px' }}>Font Style:</label>
                    <select id="font-select" onChange={handleFontChange}>
                        <option value={currentFont}>{currentFont}</option>
                        {fonts.map((font, index) => (
                            <option key={index} value={font.family}>
                                {font.family}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <label htmlFor="font-size-select" style={{ marginRight: '10px' }}>Font Size:</label>
                    <select id="font-size-select" onChange={handleFontSizeChange}>
                        <option value={currentSize}>{currentSize}</option>
                        {fontSizes.map((size, index) => (
                            <option key={index} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
