import styled from "styled-components";

export const Button = styled.button`
  margin: 20px auto 10px auto;
  min-width: 10em;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  text-align: center;
  color: #eaeaea;
  text-decoration: none;
  border: 2px solid #eaeaea;
  border-radius: 10px;
  transition: color 0.35s ease, border-color 0.35s ease,
    background-color 0.5s ease;
  background-color: #383f46;
  z-index: 1;
  // #212529;
  position: relative;

  &:hover,
  &:active {
    color: #15ff79;
    border-color: #15ff79;
    background-color: #212529;
    cursor: pointer;
  }

  &:disabled {
    color: #918787;
    border-color: #918787;
    cursor: not-allowed;
    background-color: #4b5055;
  }
`;

export const FullButton = styled(Button)`
  margin: 0;
  min-width: 0px;
  width: 100%;
  height: 100%;
`;
export const IconButton = styled(FullButton)`
  font-size: 30px;
  background: none;
  border: none;
`;
