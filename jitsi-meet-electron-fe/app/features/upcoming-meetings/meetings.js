import moment from 'moment';
import p1 from '../../images/participants/1.png';
import p2 from '../../images/participants/2.png';
import p3 from '../../images/participants/3.png';
import p4 from '../../images/participants/4.png';
import p5 from '../../images/participants/5.png';
import p6 from '../../images/participants/6.png';

export function getMeetings() {
    return [
        {
            id: '3',
            room: 'Marketing Standup',
            startDate: moment().set({ hour: 9, minute: 0, second: 0, millisecond: 0 }),
            endDate: moment().set({ hour: 9, minute: 30, second: 0, millisecond: 0 }),
            location: 'Team Room A',
            participants: [
                { id: 'u4', name: 'Diana', avatar: p1 },
                { id: 'u5', name: 'Ethan', avatar: p2 }
            ],
        },
        {
            id: '4',
            room: 'Product Sync',
            startDate: moment().set({ hour: 10, minute: 15, second: 0, millisecond: 0 }),
            endDate: moment().set({ hour: 11, minute: 0, second: 0, millisecond: 0 }),
            location: 'Room 205',
            participants: [
                { id: 'u6', name: 'Fiona', avatar: p3 },
                { id: 'u1', name: 'Alice', avatar: p4 }
            ],
        },
        {
            id: '5',
            room: 'Tech Deep Dive',
            startDate: moment().set({ hour: 14, minute: 0, second: 0, millisecond: 0 }).add(1, 'days'),
            endDate: moment().set({ hour: 15, minute: 30, second: 0, millisecond: 0 }),
            location: 'Conference Room B',
            participants: [
                { id: 'u7', name: 'George', avatar: p5 },
                { id: 'u2', name: 'Bob', avatar: p6 },
                { id: 'u1', name: 'Alice', avatar: p4 },
            ],
        },
    ]
}
