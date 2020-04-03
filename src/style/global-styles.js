import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
    
    body {
      font-family: 'Assistant', sans-serif; 
      font-size: 11px;
      line-height: 1.25em;
      margin: 0 auto;
      max-width: 1000px;
      padding: 20px;
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: 'Playfair Display', serif;
    }
`;
