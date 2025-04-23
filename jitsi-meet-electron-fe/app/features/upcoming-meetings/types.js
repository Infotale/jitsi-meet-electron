// @flow

export type MeetingItem = {
    id: string;
    room: string;
    startDate: Date;
    endDate: Date;
    location: string;
    participants: Array<Participant>;
};

type Participant = {
    id: string;
    name: string;
    avatar: string;
}
