// @flow
import styled, { css } from 'styled-components';

export default styled.div`
    width: 5rem;
    height: 5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: center;
    align-content: center;
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;

    .day {
        font-size: 2rem;
    }

    ${props => props.isToday && css`
        color: #0052CC;
    `}
`;
