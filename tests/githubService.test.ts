//TODO: add tests
// import githubService from '../src/services/githubService';

// // Mock the Octokit constructor
// jest.mock('@octokit/rest', () => {
//     return {
//         Octokit: jest.fn().mockImplementation(() => ({
//             repos: {
//                 listForUser: jest.fn().mockResolvedValue({
//                     data: [
//                         { name: 'repo1' },
//                         { name: 'repo2' }
//                     ]
//                 }),
//                 listLanguages: jest.fn().mockImplementation(({ repo }: { repo: string }) => {
//                     if (repo === 'repo1') {
//                         return { data: { JavaScript: 1000, TypeScript: 500 } };
//                     }
//                     if (repo === 'repo2') {
//                         return { data: { Python: 1500 } };
//                     }
//                     return { data: {} };
//                 })
//             }
//         }))
//     };
// });

// describe('getLanguagesFromGitHub', () => {
//     it('should aggregate languages from user repositories', async () => {
//         const languages = await githubService.getLanguagesFromGitHub('dummyUser');
        
//         expect(languages).toEqual({
//             JavaScript: 1000,
//             TypeScript: 500,
//             Python: 1500,
//         });
//     });
// });
