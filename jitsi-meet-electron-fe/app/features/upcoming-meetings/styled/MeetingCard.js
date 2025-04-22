// @flow

import styled from 'styled-components';

export default styled.div`
    display: flex;
    flex-direction: row;
    border: gray solid 1px;
    gap: 1rem;
    background: white;
    box-shadow: 3px 3px 3px rgba(0,0,0,0.1);
    border-radius: 1rem;
    color: black;
    margin: 1rem;
    padding: 1rem;
    
    &:hover {
        cursor: pointer;
    }
`;
