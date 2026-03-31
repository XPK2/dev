// User constants — avatar và thông tin 2 người
export const USERS = {
  1: {
    id: 1,
    name: 'Huy',
    code: '101203',
    avatar: 'https://scontent.fhan20-1.fna.fbcdn.net/v/t39.30808-1/650994011_4285077661755117_5659154115489226044_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=109&ccb=1-7&_nc_sid=e99d92&_nc_ohc=Pfp9aOnHSqsQ7kNvwHbJ_cD&_nc_oc=AdoaPOZieMaeyCXnEjCkuvmyIo7nMWJM3j0xOI5JNjYLbFWMt2mjVp-ScYRO-5fzxUA&_nc_zt=24&_nc_ht=scontent.fhan20-1.fna&_nc_gid=-S-UuH_CnSyZkvFB3ERruQ&_nc_ss=7a3a8&oh=00_Afz5bDy1P-pSLgZgE5cKvQQM1K8cwOGlF-pG7myNMcjvqw&oe=69D14E00',
  },
  2: {
    id: 2,
    name: 'Hà',
    code: '030403',
    avatar: 'https://scontent.fhan20-1.fna.fbcdn.net/v/t39.30808-6/616096753_2374103579706464_3774691759457128788_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_ohc=BCJbUuSETOUQ7kNvwHyPoCm&_nc_oc=AdrNSlYGSrYyQMd18TEkfDNocVVOxYlcKt0cQxp7muVO4BwXhKUG55_seG3RSUmbd_U&_nc_zt=23&_nc_ht=scontent.fhan20-1.fna&_nc_gid=3tkq9XRq6z026cRnpydCJw&_nc_ss=7a3a8&oh=00_AfxeCfMagELoSqVx4kIJNptNlG8uUPedSHrEVQonU7EPuA&oe=69D14A95',
  },
};

export const getUser = (userId) => USERS[userId] || USERS[1];
export const getAvatar = (userId) => getUser(userId).avatar;
export const getName = (userId) => getUser(userId).name;
