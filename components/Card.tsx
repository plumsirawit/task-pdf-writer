import styled from "styled-components";

export const Card = styled.div`
  margin: 1rem;
  padding: 1.5rem 3rem 1.5rem 3rem;
  text-align: left;
  color: white;
  background-color: #212529;
  text-decoration: none;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
  width: 35vw;
  @media only screen and (max-width: 900px) {
    & {
      width: 90vw;
    }
  }
`;
