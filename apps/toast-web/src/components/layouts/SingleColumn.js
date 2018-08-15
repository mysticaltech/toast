import React from 'react';
import styled from 'styled-components';

const Content = styled.div`
  margin: 0 var(--spacing-sm);
  background: var(--color-white);
  transition: 0.2s ease all;
  border-radius: var(--spacing-xs);

  @media (min-width: 900px) {
    padding: var(--spacing-sm);
    margin: 0 var(--spacing-lg);
  }
`;

const Layout = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;

  & > ${Content}:first-child {
    margin-top: ${props =>
      props.hasHeaderImage ? '20vh' : 'var(--spacing-lg)'};
  }

  & > ${Content} {
    padding: ${props => (props.hasHeaderImage ? 'var(--spacing-xs)' : '0')};
  }

  @media (min-width: 900px) {
    & > ${Content} {
      padding: ${props => (props.hasHeaderImage ? 'var(--spacing-lg)' : '0')};
    }
  }

  @media (min-width: 1600px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeaderImage = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
  height: 40vh;
  background: url(${props => props.src});
  background-size: cover;
`;

const SingleColumnLayout = ({ headerImageSrc, children }) => (
  <Layout hasHeaderImage={!!headerImageSrc}>
    {children}
    {headerImageSrc && <HeaderImage src={headerImageSrc} />}
  </Layout>
);

SingleColumnLayout.Content = Content;

export default SingleColumnLayout;
