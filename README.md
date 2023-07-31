
# AWTRIX Light Live Card #

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_screenshot.svg)

This is a card that mirrors your AWTRIX light to Home Assistant.

Configuration is straightforward and can be done via the code editor.

To fetch data from the AWTRIX Light /api/screen API endpoint into a sensor, you need to create a manual command_line sensor:


## Card configuration

|        Name        |                        Description                         | Required | Default |
| ------------------ | ---------------------------------------------------------- | -------- | --------|
| `type`             | Cart type (custom:awtrix-light-display-card)               | yes      | n/a     |
| `ipAddress`           | The name of the command_line sensor you created            | yes      | n/a     |
| `resolution`       | Resolution of the image                                    | no       | 256x64  |
| `bordersize`       | Border size in between of the pixels                       | no       | 1       |
| `borderradius`     | Configure the border radius for the image                  | no       | 10      |

Basic example:

```yaml
type: custom:awtrix-light-live-card
ipAddress: api.graafnet.nl
resolution: 256x64

```



## Troubleshooting

When the sensor is not good configured inside the card or the sensor is not recieving the approperiate data the card will display a default generated image:  

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_nodata.svg)

The sensor should have a attribute named screen:

![](https://raw.githubusercontent.com/RDG88/lovelace-awtrix-light-display-card/main/images/awtrix_sensor_screenshot.png)


# YOU are welcome to contribute #