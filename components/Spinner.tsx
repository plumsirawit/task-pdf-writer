import { MoonLoader } from "react-spinners";
import styled from "styled-components";

const SpinnerWrapper = styled.span`
  text-align: left;
  display: flex;
`;
export const Spinner = () => (
  <SpinnerWrapper>
    <MoonLoader size="15px" color="white" css="display: block" />
  </SpinnerWrapper>
);
