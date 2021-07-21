import styled, { css } from "styled-components";

export const FloatingButton = styled.button`
  margin: 0px;
  width: 64px;
  height: 64px;
  font-size: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  border: none;
  background: none;
  transition: color 0.35s ease, border-color 0.35s ease;
  position: fixed;
  cursor: pointer;
  z-index: 1;
  ${(props: { index?: number }) =>
    props.index
      ? css`
          bottom: calc(
            2vmin + ${props.index * 64}px + ${props.index * 1.5}vmin
          );
        `
      : css`
          bottom: 2vmin;
        `}
  right: 2vmin;
  &:hover,
  &:active {
    color: #15ff79;
    border-color: #15ff79;
    cursor: pointer;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  ${(props: { theme?: string }) =>
    props.theme === "dark"
      ? css`
          color: white;
        `
      : css`
          color: black;
        `}
`;
