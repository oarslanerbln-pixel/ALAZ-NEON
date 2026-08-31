## 2026-08-21 - Added htmlFor and id to PlayerPlaying.tsx form input
**Learning:** Found a missing link between a visual label and its corresponding text input in a form component (PlayerPlaying.tsx). The label element had no 'htmlFor' attribute, and the input lacked an 'id', causing screen readers to fail to announce the label when the input was focused.
**Action:** When creating forms with <label> and <input> tags, always use 'htmlFor' on the label and match it with the 'id' on the input, even if the label is adjacent or custom-styled.
