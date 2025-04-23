// @flow
import moment from 'moment';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { compose } from 'redux';
import {
    MeetingCard,
    MeetingDate,
    MeetingDescription,
    MeetingInfo,
    MeetingParticipants,
    UpcomingMeetingsContainer,
    Wrapper
} from '../styled';
import type { MeetingItem } from '../types';
import { getMeetings } from '../meetings';
import clockIcon from '../../../images/clock.png';
import locationIcon from '../../../images/location.png';
import type { RecentListItem } from '../../recent-list/types';
import { push } from 'react-router-redux';

type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * I18next translation function.
     */
    t: Function;
};

/**
 * Recent List Component.
 */
class UpcomingMeetings extends Component<Props, *> {
    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        const meetings = getMeetings();

        if (meetings.length === 0) {
            return null;
        }

        return (
            <Wrapper>
                <UpcomingMeetingsContainer>
                    {
                        meetings.map(meeting => this._renderRecentListEntry(meeting))
                    }
                </UpcomingMeetingsContainer>
            </Wrapper>
        );
    }

    /**
     * Renders the conference card.
     *
     * @param {RecentListItem} meeting - Meeting Details.
     * @returns {ReactElement}
     */
    _renderRecentListEntry(meeting: MeetingItem) {
        return (
            <MeetingCard key={meeting.id} onClick={this._onNavigateToConference(meeting)}>
                <MeetingDate isToday={moment().isSame(meeting.startDate, 'day')}>
                    <span>{ this._renderTodayDayOfAWeek(meeting.startDate) }</span>
                    <span className={"day"}>{ this._renderTodayDay(meeting.startDate) }</span>
                </MeetingDate>
                <Wrapper className={"rows"}>
                    <MeetingInfo>
                        <img alt="time" src={clockIcon} />
                        <span>{ this._renderTime(meeting.startDate) } - { this._renderTime(meeting.endDate) }</span>
                    </MeetingInfo>
                    <MeetingInfo>
                        <img alt="location" src={locationIcon} />
                        <span>{ meeting.location }</span>
                    </MeetingInfo>
                </Wrapper>
                <Wrapper className={"rows"}>
                    <MeetingDescription>{ meeting.room }</MeetingDescription>
                    <MeetingParticipants>
                        {meeting.participants.map((participant) => {
                            return (
                                <img key={participant.id} alt={participant.name} src={participant.avatar} />
                            );
                        })}
                    </MeetingParticipants>
                </Wrapper>
            </MeetingCard>
        );
    }

    _onNavigateToConference(meeting: MeetingItem) {
        return () => this.props.dispatch(push('/conference', meeting));
    }

    _renderTime(date: Date){
        return moment(date).format('LT');
    }

    _renderTodayDay(date: Date) {
        return moment(date).date();
    }

    _renderTodayDayOfAWeek(date: Date) {
        return moment(date).format('ddd')
    }
}

export default compose(connect(), withTranslation())(UpcomingMeetings);
