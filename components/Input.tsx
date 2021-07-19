import styled from "styled-components";
export const Input = styled.input`
  text-align: left;
  color: white;
  text-decoration: none;
  background-color: #212529;
  border: 1px solid #eaeaea;
  border-radius: 5px;
  font-size: 0.9rem;
  transition: color 0.15s ease, border-color 0.15s ease;
  outline: none;
  width: 100%;
  margin-bottom: 20px;
  padding: 5px;

  &:hover,
  &:focus,
  &:active {
    color: #15ff79;
    border-color: #15ff79;
  }
`;

export const InputHead = styled.h3`
  margin-bottom: 10px;
`;
