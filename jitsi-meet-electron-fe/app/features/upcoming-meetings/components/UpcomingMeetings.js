// @flow
import moment from 'moment';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
    MeetingCard,
    MeetingDate,
    MeetingDescription,
    MeetingLocation,
    MeetingParticipants,
    MeetingTime,
    UpcomingMeetingsContainer,
    Wrapper
} from '../styled';
import type { MeetingItem } from '../types';
import { getMeetings } from '../meetings';

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
            <MeetingCard key={meeting.id}>
                <MeetingDate>
                    <span className={"dayOfWeek"}>{ this._renderTodayDayOfAWeek(meeting.startDate) }</span>
                    <span className={"day"}>{ this._renderTodayDay(meeting.startDate) }</span>
                </MeetingDate>
                <Wrapper>
                    <MeetingTime></MeetingTime>
                    <MeetingLocation></MeetingLocation>
                </Wrapper>
                <Wrapper>
                    <MeetingDescription></MeetingDescription>
                    <MeetingParticipants></MeetingParticipants>
                </Wrapper>
            </MeetingCard>
        );
    }

    _renderTodayDay(date: Date) {
        return moment(date).date();
    }

    _renderTodayDayOfAWeek(date: Date) {
        return moment(date).format('ddd')
    }
}

export default compose(connect(), withTranslation())(UpcomingMeetings);
