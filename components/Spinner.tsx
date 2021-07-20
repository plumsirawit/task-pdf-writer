import { MoonLoader } from "react-spinners";
import styled from "styled-components";

const SpinnerWrapper = styled.span`
  text-align: left;
  display: flex;
`;
const SpinnerWrapperWrapper = styled.span`
  justify-content: center;
  display: flex;
  flex-direction: row;
`;
export const Spinner = (props: { big?: boolean }) => (
  <SpinnerWrapper>
    <MoonLoader
      size={props.big ? "128px" : "15px"}
      color="white"
      css="display: block"
    />
  </SpinnerWrapper>
);

export const BlackIconSpinner = () => (
  <SpinnerWrapperWrapper>
    <SpinnerWrapper>
      <MoonLoader size="36px" color="black" css="display: block" />
    </SpinnerWrapper>
  </SpinnerWrapperWrapper>
);
