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
import clockIcon from '../../../images/clock.png';
import locationIcon from '../../../images/location.png';

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
                <Wrapper className={"rows"}>
                    <MeetingTime>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <img alt="location" src={clockIcon} style={{ height: "15px", marginRight: "5px" }} />
                            <span>{ this._renderTime(meeting.startDate) } - { this._renderTime(meeting.endDate) }</span>
                        </div>
                    </MeetingTime>
                    <MeetingLocation>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <img alt="location" src={locationIcon} style={{ height: "15px", marginRight: "5px" }} />
                            <span>{ meeting.location }</span>
                        </div>
                    </MeetingLocation>
                </Wrapper>
                <Wrapper className={"rows"}>
                    <MeetingDescription>{ meeting.title }</MeetingDescription>
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
