// @flow

import styled from 'styled-components';

export default styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: flex-start;
    overflow: scroll;

    ::-webkit-scrollbar {
        display: none;
    }
`;
