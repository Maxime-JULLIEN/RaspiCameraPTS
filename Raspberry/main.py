# You need to install FFmpeg first, and add environment variables
import cv2
import subprocess

# Assigning our static_back to None
static_back = None

# List when any moving object appear
motion_list = [None, None]

# Allow to save videos from the video stream
video_saving = False

# A counter for the number of images treated with the actual background
nb_images_treated = 0

# The life time of a background in seconds
time_life_background = 5

# The number of fps of the video stream
fps = 30

# The number of image per background
max_images_per_background = time_life_background * fps

# The intensity of the blur who will be applied on the images
blur_intensity = 21
 
# RTMP server address
rtmp = r'rtmp://linkable.tech:1937/live/1'

# Capturing video
video = cv2.VideoCapture(0)
frame_width = int(video.get(3))
frame_height = int(video.get(4))
size = (frame_width, frame_height)
video.set(cv2.CAP_PROP_FPS, fps)
result = cv2.VideoWriter('filename.avi', cv2.VideoWriter_fourcc(*'MJPG'), 10, size)

sizeStr = str(size[0]) + 'x' + str(size[1])


command = ['ffmpeg',
    '-y', '-an',
    '-f', 'rawvideo',
    '-vcodec','rawvideo',
    '-pix_fmt', 'bgr24',
    '-s', sizeStr,
    '-r', '25',
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'ultrafast',
    '-f', 'flv',
    rtmp]

pipe = subprocess.Popen(command, shell=False, stdin=subprocess.PIPE)

while video.isOpened():
    success, frame = video.read()

    # Write the frame if we are saving a video
    if video_saving:
        result.write(frame)

    # Motion var, motion = 0 -> no movements
    motion = 0

    # Converting color image to gray image
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # GaussianBlur : allow to reduce the noise and the details of the image by applying an blurred effect
    gray = cv2.GaussianBlur(gray, (blur_intensity, blur_intensity), 0)

    # Save the initial image
    if static_back is None or nb_images_treated >= max_images_per_background:
        static_back = gray
        nb_images_treated = 0
        continue
    nb_images_treated += 1

    # Difference between the static background (initial image) and the current frame
    diff_frame = cv2.absdiff(static_back, gray)

    # threshold -> seuil
    # We apply a THRESH_BINARY : if pixel intensity is greater than the set threshold
    # then the value will be set to 255, else it will be set to 0.
    # This give us an black image with movements represented has white pixels
    # This method is called background subtraction
    threshold = 30
    pixel_value_if_movement = 255
    thresh_frame = cv2.threshold(diff_frame, threshold, pixel_value_if_movement, cv2.THRESH_BINARY)[1]

    # The we increase the white region in the image (the region where a movement is detected)
    # In order to help our algorithm to determine the movements.
    # This operation is called dilatation
    thresh_frame = cv2.dilate(thresh_frame, None, iterations=2)

    # Recover the countours of the moving objects/humans/...
    cnts, _ = cv2.findContours(thresh_frame.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Draw the countours
    for contour in cnts:
        if cv2.contourArea(contour) < 10000:
            continue
        motion = 1

        (x, y, w, h) = cv2.boundingRect(contour)
        # Create rectangle around the detected movements
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 3)

    motion_list.append(motion)
    motion_list = motion_list[-2:]

    # When a movement is detected
    if motion_list[-1] == 1 and motion_list[-2] == 0:
        video_saving = True
        cv2.imwrite("capture.jpg", frame)
        if video_saving:
            result.write(frame)

    # When there is no more movements
    if motion_list[-1] == 0 and motion_list[-2] == 1:
        video_saving = False
        if video_saving:
            result.release()

    if success:
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        pipe.stdin.write(frame.tostring())

    key = cv2.waitKey(1)
    # q to stop the camera
    if key == ord('q'):
        # if there is an movement when we cut the camera
        if motion == 1:
            result.release()
        break

video.release()
pipe.terminate()

# Destroying all the windows
cv2.destroyAllWindows()