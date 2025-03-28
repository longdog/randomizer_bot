export type DbUser = {
  name: string;
  id: number;
  username: string;
};
export type DbChannel = {
  name: string;
  description: string;
  id: number;
};

export type DbEvent = {
  name: string;
  id: number;
  channelId: number;
};

export const dbService = () => {
  return {
    async addUser(user: DbUser) {},
    async addChannel(channel: DbChannel, userId: number) {},
    async deleteChannel(channelId: number, userId: number) {},
    async addEvent(event: DbEvent, channelId: number) {},
    async addEventUser(eventId: number, user: DbUser) {},
    async deleteEvent(eventId: number, channelId: number) {},
    async getEvent(eventId: number) {},
    async getChannels(userId: number) {},
  };
};
