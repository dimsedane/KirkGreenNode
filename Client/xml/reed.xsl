<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="html" indent="yes" encoding="UTF-8" />
	<xsl:template match="/">
		<h1>The courses available at Reed</h1>
		<table>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Instructor</th>
				<th>Building</th>
				<th>Room</th>
			</tr>
			<xsl:for-each select="root/course">
				<!-- Some ugly if check to conclude that all values are represented. 
					This is needed since the data source is not properly clean -->
				<xsl:if test="instructor != ''">

					<tr>
						<td>
							<xsl:value-of select="reg_num" />
						</td>
						<td>
							<xsl:value-of select="title" />
						</td>
						<td>
							<xsl:value-of select="instructor" />
						</td>
						<td>
							<xsl:value-of select="place/building" />
						</td>
						<td>
							<xsl:value-of select="place/room" />
						</td>
					</tr>

				</xsl:if>
			</xsl:for-each>
		</table>
	</xsl:template>
</xsl:stylesheet>