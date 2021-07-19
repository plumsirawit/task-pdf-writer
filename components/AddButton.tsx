import styled from "styled-components";

export const AddButton = styled.button`
  margin: 0px;
  width: 64px;
  height: 64px;
  font-size: 50px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  text-decoration: none;
  border: 1px solid #fc6dc0;
  border-radius: 32px;
  transition: color 0.35s ease, border-color 0.35s ease;
  background-color: #fc6dc0;
  position: fixed;
  bottom: 2vmin;
  right: 2vmin;

  &:hover,
  &:active {
    color: white;
    border-color: white;
    cursor: pointer;
  }

  &:disabled {
    color: #918787;
    border-color: #918787;
    cursor: not-allowed;
    background-color: #4b5055;
  }
  &:before,
  &:after {
    content: "";
    position: absolute;
    inset: 16px;
    background: white;
  }
  &:before {
    width: 3px;
    margin: 3px auto;
  }
  &:after {
    margin: auto 3px;
    height: 3px;
  }
`;
